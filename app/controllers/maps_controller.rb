class MapsController < ApplicationController
  def show
    respond_to do |format|
      format.html do
      end
      format.json do
        if params[:latitude] && params[:longitude]
          if params[:related] == 'true'
            @photos = Photo.near([params[:latitude], params[:longitude]], 0.1).where.not(id: params[:photoId].to_i)
            @criteria = "What's Poppin' Near You"
          else
            @photos = Photo.most_visited.near([params[:latitude], params[:longitude]], 0.25, :order => 'distance')
            @criteria = "What's Poppin' Near You"
          end
        else
          @photos = Photo.most_visited.with_attached_image.includes(:user, :visits).limit(50)
          @criteria = "What's Poppin'"
        end
        
        if @photos.count(:all) < 5 && params[:related] == 'false'
          @photos = Photo.most_visited.with_attached_image.includes(:user, :visits).limit(50)
          @criteria = "What's Poppin'"
        end

        render json: {
          criteria: @criteria,
          photos: @photos.map do |photo|
            {
              id: photo.id,
              image: url_for(photo.image),
              location: url_for(photo),
              visits: photo.visits.count,
              longitude: photo.longitude,
              latitude: photo.latitude,
              distance: photo.distance_to([params[:latitude], params[:longitude]]),
              user: {
                email: photo.user.email
              }
            }
          end  
        }
      end
    end
  end
end
