class Location < ActiveRecord::Base
  attr_accessible :address, :latitude, :longitude, :zoom
  geocoded_by :address
  after_validation :geocode, :if => :address_changed?

  validates :address, presence: true
  validates :zoom, presence: true


  def imageurl(lat , long , zoom , map_type, map_size)
      #return "http://maps.google.com/maps/api/staticmap?size=640x640&sensor=false&zoom=#{zoom}&markers=#{lat}%2C#{long}"
      return  "https://maps.googleapis.com/maps/api/staticmap?maptype=#{map_type}&center=#{lat},#{long}&zoom=#{zoom}&size=#{map_size}"
  end
end
