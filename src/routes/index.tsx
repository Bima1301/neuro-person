import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/integrations/better-auth/client";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const features = [
    {
      icon: Users,
      title: "Manajemen Karyawan",
      description:
        "Kelola data karyawan dengan mudah. Tambah, edit, dan pantau status karyawan dalam satu platform.",
    },
    {
      icon: Clock,
      title: "Pengelolaan Absensi",
      description:
        "Sistem absensi otomatis dengan laporan kehadiran real-time. Pantau kedisiplinan tim Anda.",
    },
    {
      icon: CreditCard,
      title: "Penggajian Otomatis",
      description:
        "Hitung gaji, tunjangan, dan potongan secara otomatis. Generate slip gaji digital dengan mudah.",
    },
    {
      icon: Calendar,
      title: "Manajemen Cuti",
      description:
        "Pengajuan dan persetujuan cuti online. Tracking saldo cuti karyawan secara real-time.",
    },
    {
      icon: BarChart3,
      title: "Laporan & Analitik",
      description:
        "Dashboard analitik untuk pengambilan keputusan HR yang lebih baik dan berbasis data.",
    },
    {
      icon: Shield,
      title: "Keamanan Data",
      description:
        "Data karyawan terlindungi dengan enkripsi dan kontrol akses berbasis peran (RBAC).",
    },
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "HR Manager, PT Maju Bersama",
      content:
        "Super Track ini sangat membantu kami mengelola 500+ karyawan. Proses penggajian yang dulu memakan waktu 3 hari, sekarang hanya butuh beberapa jam.",
      rating: 5,
    },
    {
      name: "Siti Rahayu",
      role: "CEO, Startup Tech Indonesia",
      content:
        "Fitur manajemen cuti sangat praktis. Karyawan bisa mengajukan cuti dari mana saja, dan saya bisa approve langsung dari HP.",
      rating: 5,
    },
    {
      name: "Ahmad Wijaya",
      role: "HRD, Retail Company",
      content:
        "Laporan absensi yang detail membantu kami mengidentifikasi masalah kedisiplinan lebih awal. Sangat recommended!",
      rating: 5,
    },
  ];

  const benefits = [
    "Hemat waktu hingga 70% untuk administrasi HR",
    "Akses dari mana saja, kapan saja",
    "Integrasi dengan sistem penggajian",
    "Support 24/7 dari tim ahli",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">Super Track</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Fitur
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimoni
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Harga
              </a>
            </div>
            <div className="flex items-center gap-3">
              {!session?.user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate({ to: "/sign-in" })}
                  >
                    Masuk
                  </Button>
                  <Button onClick={() => navigate({ to: "/sign-up" })}>
                    Daftar
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/app">Dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-primary" />
              Dipercaya oleh 1000+ perusahaan di Indonesia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Sistem Manajemen{" "}
              <span className="text-primary">Sumber Daya Manusia</span> yang
              Mudah dan Efisien
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kelola karyawan, absensi, cuti, dan penggajian dalam satu platform
              terintegrasi. Hemat waktu, tingkatkan produktivitas tim HR Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!session?.user ? (
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => navigate({ to: "/sign-up" })}
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link to="/app">
                    Masuk ke Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="text-lg px-8">
                Pelajari Lebih Lanjut
              </Button>
            </div>

            {/* Benefits */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fitur Lengkap untuk Kebutuhan HR Anda
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola sumber daya manusia
              perusahaan dalam satu platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Dipercaya oleh Profesional HR
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lihat apa kata mereka yang sudah menggunakan sistem Super Track kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, index) => (
                      <Star
                        key={index}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Siap Mengoptimalkan Manajemen HR Anda?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Daftar sekarang dan mulai kelola HR perusahaan Anda dengan lebih
            efisien.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!session?.user ? (
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => navigate({ to: "/sign-up" })}
              >
                Daftar Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                asChild
              >
                <Link to="/app">
                  Masuk ke Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10"
            >
              Hubungi Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Super Track</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistem manajemen sumber daya manusia terlengkap untuk perusahaan
                Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Fitur
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Harga
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Integrasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Karir
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Keamanan
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Super Track. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
