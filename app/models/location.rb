class Location < ActiveRecord::Base
  attr_accessible :address, :latitude, :longitude
  geocoded_by :address
  after_validation :geocode, :if => :address_changed?

  def imageurl(lat , long , zoom)
      "http://maps.google.com/maps/api/staticmap?size=640x640&sensor=false&zoom=#{zoom}&markers=#{lat}%2C#{long}"
  end
end
