import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-black border-t border-zinc-800/50 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-6">
        <div className="font-headline font-bold text-[#BAFF39] text-xl">CDGI Sports Sphere</div>
        <div className="font-body text-sm tracking-tight text-zinc-600 text-center">
          © 2024 CDGI Sports Sphere. Engineered for Velocity.
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-zinc-600 hover:text-white transition-colors font-body text-sm tracking-tight">Privacy Policy</a>
          <a href="#" className="text-zinc-600 hover:text-white transition-colors font-body text-sm tracking-tight">Terms of Service</a>
          <a href="#" className="text-zinc-600 hover:text-white transition-colors font-body text-sm tracking-tight">Support</a>
        </div>
      </div>
    </footer>
  );
}
