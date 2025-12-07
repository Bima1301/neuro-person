'use client'

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-geosearch/dist/geosearch.css'

import L from 'leaflet'
import 'leaflet-draw'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import { MapPin, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  FeatureGroup,
  MapContainer,
  Polygon,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LocationPickerProps {
  value?: {
    polygon?: Array<[number, number]>
    center?: { lat: number; lng: number }
  }
  onChange?: (
    value: {
      polygon: Array<[number, number]>
      center: { lat: number; lng: number }
    } | null,
  ) => void
}

function SearchControl() {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider()
    const searchControl = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: 'Cari lokasi...',
    })

    map.addControl(searchControl)
    return () => {
      map.removeControl(searchControl)
    }
  }, [map])

  return null
}

function DrawControls({
  onCreated,
  onDeleted,
  onEdited,
}: {
  onCreated: (e: L.DrawEvents.Created) => void
  onDeleted: () => void
  onEdited: (e: L.DrawEvents.Edited) => void
}) {
  return (
    <FeatureGroup>
      <EditControl
        position="topright"
        onCreated={onCreated}
        onDeleted={onDeleted}
        onEdited={onEdited}
        draw={{
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e1e1',
              message: '<strong>Area tidak boleh berpotongan!</strong>',
            },
            shapeOptions: {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
            },
          },
        }}
        edit={{
          edit: false,
          remove: false,
        }}
      />
    </FeatureGroup>
  )
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [points, setPoints] = useState<Array<[number, number]>>(
    value?.polygon || [],
  )
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    value?.center || { lat: -6.2088, lng: 106.8456 }, // Default: Jakarta
  )
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (value?.polygon) {
      setPoints(value.polygon)
    }
    if (value?.center) {
      setCenter(value.center)
    }
  }, [value])

  const handleCreated = (e: L.DrawEvents.Created) => {
    const layer = e.layer as L.Polygon
    const latLngs = layer.getLatLngs()[0] as Array<L.LatLng>
    const newPoints: Array<[number, number]> = latLngs.map((ll) => [
      ll.lat,
      ll.lng,
    ])

    // Calculate center
    const latSum = newPoints.reduce((sum, p) => sum + p[0], 0)
    const lngSum = newPoints.reduce((sum, p) => sum + p[1], 0)
    const newCenter = {
      lat: latSum / newPoints.length,
      lng: lngSum / newPoints.length,
    }

    setPoints(newPoints)
    setCenter(newCenter)
    onChange?.({ polygon: newPoints, center: newCenter })
  }

  const handleEdited = (e: L.DrawEvents.Edited) => {
    const layers = e.layers
    layers.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latLngs = layer.getLatLngs()[0] as Array<L.LatLng>
        const newPoints: Array<[number, number]> = latLngs.map((ll) => [
          ll.lat,
          ll.lng,
        ])

        const latSum = newPoints.reduce((sum, p) => sum + p[0], 0)
        const lngSum = newPoints.reduce((sum, p) => sum + p[1], 0)
        const newCenter = {
          lat: latSum / newPoints.length,
          lng: lngSum / newPoints.length,
        }

        setPoints(newPoints)
        setCenter(newCenter)
        onChange?.({ polygon: newPoints, center: newCenter })
      }
    })
  }

  const handleDeleted = () => {
    setPoints([])
    onChange?.(null)
  }

  const handleClear = () => {
    setPoints([])
    onChange?.(null)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCenter(newCenter)
          mapRef.current?.setView([newCenter.lat, newCenter.lng], 17)
        },
        (error) => {
          toast.error('Gagal mengambil lokasi saat ini')
          console.error('Error getting location:', error)
        },
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Area Perusahaan (Geofencing)</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCurrentLocation}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Lokasi Saya
          </Button>
          {points.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus Area
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Gunakan tool polygon di kanan atas peta untuk menggambar area
        perusahaan.
      </p>

      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={17}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SearchControl />
          {points.length === 0 && (
            <DrawControls
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              onEdited={handleEdited}
            />
          )}
          {points.length >= 3 && (
            <Polygon
              positions={points}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.3,
              }}
            />
          )}
        </MapContainer>
      </div>

      {points.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {points.length} titik dipilih - Area valid ✓
        </p>
      )}
    </div>
  )
}
