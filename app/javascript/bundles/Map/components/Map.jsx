import React, { Component } from 'react'
import SprayCan from './images/paintcan.svg';

class Map extends Component {
  componentDidMount() {
    const { token, coordinates } = this.props;
    mapboxgl.accessToken = token
    const mapOptions = {
      container: this.mapContainer,
      style: `mapbox://styles/cuellarn/cjz7h4yaq24bv1cmxah88k89k`,
      zoom: 13,
      center: coordinates
    }
    const geolocationOptions = {
      enableHighAccuracy: true,
      maximumAge        : 30000,
      timeout           : 27000
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        // success callback
        (position) => {
          mapOptions.center = [position.coords.longitude, position.coords.latitude]
          this.createMap(mapOptions, geolocationOptions)
        },
        // failure callback
        () => this.createMap(mapOptions, geolocationOptions),
        // options
        geolocationOptions
      );
    }
    else this.createMap(mapOptions, geolocationOptions)
  }

  createMap = (mapOptions, geolocationOptions) => {
    this.map = new mapboxgl.Map(mapOptions)
    this.map.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: geolocationOptions, trackUserLocation: true })
    )
    this.map.on('load', () => {
      this.map.loadImage(SprayCan, (err, img) => !err && this.map.addImage('paintcan', img))
      this.map.addSource('photos',
      {
        type: 'geojson',
        data: '/map.json',
        cluster: true,
        clusterMaxZoom: 24,
        clusterRadius: 50,
      })
      this.map.addLayer({
        id: 'photos',
        type: 'symbol',
        source: 'photos',
        layout: {
          'icon-image': 'paintcan',
          'icon-size': 0.1,
          'icon-allow-overlap': true,
        }
      });
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'photos',
        filter: ['has', 'point_count'],
        paint: { "circle-color": ["rgba", 0,0,0,0] }
      })
      this.map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "photos",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        }
      });
      this.map.on('click', 'photos', this.handleMarkerClick)
    })
  }

  handleMarkerClick = e => {
    const map = this.map;
    const { properties, geometry = {} } = e.features[0]
    if (properties.cluster){
      const zoom = map.getZoom() + 1
      const center = [e.lngLat.lng, e.lngLat.lat]
      map.flyTo({ center, zoom })
    }else{
      const coordinates = [...geometry.coordinates]
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="popup">
            <a href="/photos/${properties.id}">
              <img src=${properties.image} />
            </a>
          </div>
        `)
        .addTo(map)
    }
  }

  render(){
    const styles = {
      width:            '100%',
      height:           '100vh',
      backgroundColor:  'azure',
      margin:           '0'
    }
    return <div style={styles} ref={el => this.mapContainer = el}></div>
  }

  componentWillUnmount() {
    this.map.remove()
  }
}

export default Map