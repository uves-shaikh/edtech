import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-foreground/20 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-foreground/60">
            <p>© 2025 EdTech Platform. Built with Next.js 16</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-foreground/80">
              <p className="font-semibold">Developer:</p>
              <p className="text-foreground/60">Uves Shaikh</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="https://github.com/uves-shaikh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/in/uves-shaikh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
