'use client';

import KiroIcon from './KiroIcon';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-foreground/10 py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <a
                        href="https://github.com/MarkoKrajceski/marko"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors duration-200 cursor-pointer"
                        aria-label="View source code on GitHub - Made with love, coffee, and Kiro"
                    >
                        Made with love❤️, coffee☕, and Kiro <KiroIcon className="w-4 h-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}