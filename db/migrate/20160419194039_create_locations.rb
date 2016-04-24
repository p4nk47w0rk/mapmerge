class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.string :address
      t.float :latitude
      t.float :longitude
      t.integer :zoom
      t.integer :tile_size
      t.integer :map_size
      
      t.timestamps null: false
    end
  end
end
