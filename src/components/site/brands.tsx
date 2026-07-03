'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Brand {
    name: string;
    logoUrl: string;
}

const brands: Brand[] = [
    { name: 'Club House', logoUrl: '' },
    { name: 'Spa & Wellness', logoUrl: '' },
    { name: 'Canchas de Tenis', logoUrl: '' },
    { name: 'Piscina Climatizada', logoUrl: '' },
    { name: 'Helipuerto VIP', logoUrl: '' },
    { name: 'Senderos Ecológicos', logoUrl: '' },
    { name: 'Gimnasio Premium', logoUrl: '' },
    { name: 'Seguridad Privada', logoUrl: '' },
    { name: 'Control Biométrico', logoUrl: '' },
    { name: 'Áreas Infantiles', logoUrl: '' },
    { name: 'Restaurante Gourmet', logoUrl: '' },
    { name: 'Campo de Golf', logoUrl: '' }
];

const BrandItem = ({ brand }: { brand: Brand }) => {
    return (
        <div className="flex-shrink-0 w-[220px] flex items-center justify-center px-10">
            <span className="text-sm font-headline font-black uppercase tracking-widest text-[#0f5b3a] dark:text-[#C5B39C] text-center">
                {brand.name}
            </span>
        </div>
    );
};

export default function Brands() {
    const infiniteBrands = [...brands, ...brands];

    return (
        <section id="marcas" className="relative py-14 overflow-hidden scroll-mt-14">
            <div className="absolute inset-y-2 inset-x-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-y border-slate-200 dark:border-white/10 shadow-lg z-0" />

            <div className="container mx-auto px-6 mb-10 text-center max-w-5xl relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                    Servicios Exclusivos y <br />
                    <span className="text-primary">Amenidades del Barrio</span>
                </h2>
            </div>

            <div className="relative w-full overflow-hidden flex z-10">
                <style jsx>{`
                    @keyframes slide {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-slide {
                        animation: slide 75s linear infinite;
                        width: max-content;
                    }
                `}</style>

                <div className="animate-slide flex items-center py-6">
                    {infiniteBrands.map((brand, idx) => (
                        <BrandItem key={idx} brand={brand} />
                    ))}
                </div>
            </div>
        </section>
    );
}