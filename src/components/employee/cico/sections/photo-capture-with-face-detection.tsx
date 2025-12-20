import { AlertCircle, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

interface PhotoCaptureSectionProps {
    capturedPhoto: string | null;
    onPhotoChange: (photo: string | null) => void;
}

export function PhotoCaptureWithFaceDetection({
    capturedPhoto,
    onPhotoChange,
}: PhotoCaptureSectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [model, setModel] = useState<any>(null);
    const [modelLoading, setModelLoading] = useState(true);
    const animationFrameRef = useRef<number>(0);

    // Load TensorFlow and BlazeFace model
    useEffect(() => {
        const loadModel = async () => {
            try {
                setModelLoading(true);
                await tf.ready();
                const loadedModel = await blazeface.load();
                setModel(loadedModel);
                setModelLoading(false);
                console.log("Face detection model loaded successfully");
            } catch (error) {
                console.error("Error loading face detection model:", error);
                setModelLoading(false);
            }
        };
        loadModel();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Start webcam
    const startWebcam = async () => {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(err => {
                        console.error("Error playing video:", err);
                    });
                };
            }

            setIsCapturing(true);
            setFaceDetected(false);
        } catch (error) {
            console.error("Error accessing webcam:", error);
            alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
        }
    };

    // Stop webcam
    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setIsCapturing(false);
        setFaceDetected(false);
    };

    // Face detection loop
    useEffect(() => {
        if (!isCapturing || !model || !videoRef.current || !canvasRef.current) {
            return;
        }

        const detectFaces = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas) {
                animationFrameRef.current = requestAnimationFrame(detectFaces);
                return;
            }

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;

                canvas.width = videoWidth;
                canvas.height = videoHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    animationFrameRef.current = requestAnimationFrame(detectFaces);
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                try {
                    const predictions = await model.estimateFaces(video, false);

                    setFaceDetected(predictions.length > 0);

                    predictions.forEach((prediction: any) => {
                        const start = prediction.topLeft;
                        const end = prediction.bottomRight;
                        const size = [end[0] - start[0], end[1] - start[1]];

                        // Draw main rectangle
                        ctx.strokeStyle = '#84cc16';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(start[0], start[1], size[0], size[1]);

                        // Draw corner accents
                        const cornerLength = 30;
                        ctx.strokeStyle = '#84cc16';
                        ctx.lineWidth = 5;

                        // Top-left
                        ctx.beginPath();
                        ctx.moveTo(start[0], start[1] + cornerLength);
                        ctx.lineTo(start[0], start[1]);
                        ctx.lineTo(start[0] + cornerLength, start[1]);
                        ctx.stroke();

                        // Top-right
                        ctx.beginPath();
                        ctx.moveTo(end[0] - cornerLength, start[1]);
                        ctx.lineTo(end[0], start[1]);
                        ctx.lineTo(end[0], start[1] + cornerLength);
                        ctx.stroke();

                        // Bottom-left
                        ctx.beginPath();
                        ctx.moveTo(start[0], end[1] - cornerLength);
                        ctx.lineTo(start[0], end[1]);
                        ctx.lineTo(start[0] + cornerLength, end[1]);
                        ctx.stroke();

                        // Bottom-right
                        ctx.beginPath();
                        ctx.moveTo(end[0] - cornerLength, end[1]);
                        ctx.lineTo(end[0], end[1]);
                        ctx.lineTo(end[0], end[1] - cornerLength);
                        ctx.stroke();

                        // Draw landmarks
                        if (prediction.landmarks) {
                            ctx.fillStyle = '#84cc16';
                            prediction.landmarks.forEach((landmark: Array<number>) => {
                                ctx.beginPath();
                                ctx.arc(landmark[0], landmark[1], 3, 0, 2 * Math.PI);
                                ctx.fill();
                            });
                        }
                    });
                } catch (error) {
                    console.error("Error detecting faces:", error);
                }
            }

            animationFrameRef.current = requestAnimationFrame(detectFaces);
        };

        detectFaces();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isCapturing, model]);

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
            onPhotoChange(imageSrc);
            stopWebcam();
        }
    };

    const handleRetake = () => {
        onPhotoChange(null);
        startWebcam();
    };

    const handleCancel = () => {
        stopWebcam();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Camera className="h-7 w-7 text-lime-400" />
                        Ambil Foto dengan Face Detection
                    </h2>

                    <div className="space-y-4">
                        {!capturedPhoto && !isCapturing && (
                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={startWebcam}
                                    disabled={modelLoading}
                                    className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${modelLoading
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-slate-900 shadow-lime-500/30'
                                        }`}
                                >
                                    <Camera className="h-6 w-6" />
                                    {modelLoading ? 'Memuat Model...' : 'Buka Kamera'}
                                </button>
                                <p className="text-slate-400 text-sm text-center">
                                    Sistem akan mendeteksi wajah secara otomatis
                                </p>
                            </div>
                        )}

                        {isCapturing && !capturedPhoto && (
                            <div className="space-y-4">
                                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-slate-700">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    />

                                    {/* Status Indicator */}
                                    <div className="absolute top-4 left-4 right-4 z-10">
                                        <div
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md transition-all duration-300 ${faceDetected
                                                ? 'bg-lime-500/20 border-2 border-lime-400'
                                                : 'bg-red-500/20 border-2 border-red-400'
                                                }`}
                                        >
                                            <div
                                                className={`w-3 h-3 rounded-full animate-pulse ${faceDetected ? 'bg-lime-400' : 'bg-red-400'
                                                    }`}
                                            />
                                            <span
                                                className={`font-semibold ${faceDetected ? 'text-lime-300' : 'text-red-300'
                                                    }`}
                                            >
                                                {faceDetected ? '✓ Wajah Terdeteksi' : '⚠ Tidak Ada Wajah'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    {!faceDetected && (
                                        <div className="absolute bottom-4 left-4 right-4 z-10">
                                            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700">
                                                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-slate-200">
                                                    Posisikan wajah Anda di depan kamera agar terdeteksi
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!faceDetected}
                                        className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${faceDetected
                                            ? 'bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-slate-900 shadow-lg shadow-lime-500/30'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <Camera className="h-5 w-5" />
                                        Ambil Foto
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}

                        {capturedPhoto && (
                            <div className="space-y-4">
                                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-lime-400/50 shadow-lg shadow-lime-400/20">
                                    <img
                                        src={capturedPhoto}
                                        alt="Captured"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-lime-500/20 backdrop-blur-md border-2 border-lime-400 px-4 py-2 rounded-lg">
                                            <span className="text-lime-300 font-semibold text-sm">
                                                ✓ Foto Tersimpan
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRetake}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                >
                                    Ambil Ulang
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}