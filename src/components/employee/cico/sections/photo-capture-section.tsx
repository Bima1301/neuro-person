import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";

interface PhotoCaptureSectionProps {
    capturedPhoto: string | null;
    onPhotoChange: (photo: string | null) => void;
}

export function PhotoCaptureSection({
    capturedPhoto,
    onPhotoChange,
}: PhotoCaptureSectionProps) {
    const webcamRef = useRef<Webcam>(null);
    const [isCapturing, setIsCapturing] = useState(false);


    const capturePhoto = () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            onPhotoChange(imageSrc);
            setIsCapturing(false);
        }
    };

    const handleRetake = () => {
        onPhotoChange(null);
        setIsCapturing(true);
    };

    return (
        <div className="space-y-4">
            {!capturedPhoto && !isCapturing && (
                <div className="flex flex-col items-center gap-4">
                    <Button
                        onClick={() => setIsCapturing(true)}
                        className="w-full bg-button-employee"
                        size="lg"
                    >
                        <Camera className="mr-2 h-5 w-5" />
                        Buka Kamera
                    </Button>
                </div>
            )}

            {isCapturing && !capturedPhoto && (
                <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 1280,
                                height: 720,
                                facingMode: "user",
                            }}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={capturePhoto}
                            className="flex-1 bg-button-employee"
                            variant="default"
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Ambil Foto
                        </Button>
                        <Button
                            onClick={() => setIsCapturing(false)}
                            className="flex-1 bg-[#252932] border-white/10 text-white hover:bg-[#2a2d35]"
                            variant="outline"
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            )}

            {capturedPhoto && (
                <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-lime-400/30">
                        <img
                            src={capturedPhoto}
                            alt="Captured"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleRetake}
                            variant="outline"
                            className="flex-1 bg-[#252932] border-white/10 text-white hover:bg-[#2a2d35]"
                        >
                            Ambil Ulang
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

