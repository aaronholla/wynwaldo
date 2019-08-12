class PhotosController < ApplicationController
  before_action :set_photo, only: [:destroy]

  def index
    @photo = Photo.new
    @photos = Photo.with_attached_image.includes(:user)
  end

  def show
    @photo = Photo.find_by_id(params[:id])
  end

  def create
    photo = current_user.photos.create(photo_params)
    photo.image.blob.analyze
    if photo.image.blob.metadata["latitude"] && photo.image.blob.metadata["longitude"]
      flash[:notice] = "Photo uploaded!"
      render json: { location: photo_path(photo) }
    else
      photo.destroy
      flash[:alert] = "Sorry, we couldn't determine the location of that photo."
      render json: { location: root_path }
    end
  end

  def destroy
    if current_user == @photo.user
    @photo.destroy
    redirect_to root_path,
      notice: 'Photo was successfully deleted.'
    else
      redirect_to root_path,
      alert: 'This is not your photo.'
    end
  end

  private
  def set_photo
    @photo = current_user.photos.find(params[:id])
  end

  def photo_params
    params.require(:photo).permit(:image)
  end
end
