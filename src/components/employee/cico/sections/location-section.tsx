import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

interface LocationSectionProps {
    location: { lat: number; lng: number } | null;
    onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

export function LocationSection({ location, onLocationChange }: LocationSectionProps) {
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    useEffect(() => {
        delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
    }, []);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation tidak didukung oleh browser Anda");
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onLocationChange({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError(null);
                setIsGettingLocation(false);
            },
            (error) => {
                let errorMessage = "Gagal mendapatkan lokasi";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informasi lokasi tidak tersedia.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Waktu permintaan lokasi habis.";
                        break;
                }
                setLocationError(errorMessage);
                setIsGettingLocation(false);
                toast.error(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/90">
                    Lokasi GPS
                </label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="bg-[#252932] border-white/10 text-white hover:bg-[#2a2d35]"
                >
                    <MapPin className="h-4 w-4 mr-1" />
                    {isGettingLocation ? "Mengambil..." : "Refresh Lokasi"}
                </Button>
            </div>
            {locationError && (
                <p className="text-sm text-red-400">{locationError}</p>
            )}
            {location ? (
                <div className="h-48 rounded-lg overflow-hidden border border-white/10">
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={17}
                        className="h-full w-full"
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[location.lat, location.lng]} />
                    </MapContainer>
                </div>
            ) : (
                <div className="h-48 bg-[#252932] rounded-lg border border-white/10 flex items-center justify-center">
                    <div className="text-center text-white/60">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Mengambil lokasi GPS...</p>
                    </div>
                </div>
            )}
            {location && (
                <p className="text-xs text-white/60">
                    Koordinat: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
            )}
        </div>
    );
}

