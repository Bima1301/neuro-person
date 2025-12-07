
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/integrations/better-auth/client";

export default function Header() {
    const { data: session } = useSession();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);


    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };


    return (
        <div className="bg-zinc-800 text-white px-4 pt-8 pb-28 rounded-b-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-white/60 text-sm mb-1">Selamat datang,</p>
                    <h1 className="text-2xl font-bold text-white">
                        {session?.user?.name || "Karyawan"}
                    </h1>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-full"
                >
                    <Bell className="h-6 w-6" />
                </Button>
            </div>

            <div className="text-center py-8">
                <div className="text-6xl font-bold mb-3 text-white">
                    {formatTime(currentTime)}
                </div>
                <p className="text-white/60 text-lg font-medium">{formatDate(currentTime)}</p>
            </div>
        </div>
    )
}
