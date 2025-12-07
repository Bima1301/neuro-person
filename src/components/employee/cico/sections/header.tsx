import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

export default function Header() {
    const navigate = useNavigate();
    const { type } = useParams({ from: "/employee/cico/$type" });
    const currentTime = new Date();
    const isCheckIn = type === "check-in";


    return (
        <div className="bg-[#282c34] text-white px-6 pt-12 pb-8">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-full transition-colors"
                    onClick={() => navigate({ to: "/employee" })}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isCheckIn ? "Check In" : "Check Out"}
                    </h1>
                    <p className="text-sm text-white/60">Rekam kehadiran Anda</p>
                </div>
            </div>

            {/* Time Info Card */}
            <div className="bg-[#1e2128] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`size-8 bg-button-employee rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Clock className="size-4 text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-medium">Waktu Sekarang</p>
                            <p className="text-white font-bold text-2xl">
                                {currentTime.toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right bg-[#252932] rounded-xl p-3 border border-white/5">
                        <p className="text-white/60 text-xs font-medium mb-1">Tanggal</p>
                        <p className="text-white font-semibold text-sm">
                            {currentTime.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
