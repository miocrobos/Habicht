'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface Court {
  id: string
  name: string
  description: string | null
  address: string
  city: string
  canton: string
  latitude: number
  longitude: number
  indoor: boolean
  courtsCount: number
  website: string | null
}

// Custom pin so we don't depend on Leaflet's default image assets (which break with bundlers).
const pinIcon = L.divIcon({
  className: 'court-pin',
  html: `<div style="transform:translate(-50%,-100%)">
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="#dc2626"/>
      <circle cx="15" cy="15" r="6" fill="#ffffff"/>
    </svg>
  </div>`,
  iconSize: [30, 42],
  iconAnchor: [0, 0],
})

interface CourtsMapProps {
  courts: Court[]
  center?: [number, number]
  zoom?: number
}

export default function CourtsMap({ courts, center = [46.8182, 8.2275], zoom = 8 }: CourtsMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {courts.map((court) => (
        <Marker key={court.id} position={[court.latitude, court.longitude]} icon={pinIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-gray-900">{court.name}</p>
              <p className="text-xs text-gray-600">
                {court.address}, {court.city} ({court.canton})
              </p>
              {court.description && (
                <p className="mt-1 text-xs text-gray-500">{court.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-600">
                {court.indoor ? 'Indoor' : 'Outdoor'} · {court.courtsCount}{' '}
                {court.courtsCount === 1 ? 'court' : 'courts'}
              </p>
              {court.website && (
                <a
                  href={court.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-red-600 hover:underline"
                >
                  Website
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
