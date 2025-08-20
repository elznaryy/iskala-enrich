import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  showText?: boolean;
  white?: boolean;
}

export default function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  href = '/',
  showText = true,
  white = false,
}: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 36, iconSize: 24 },
    md: { width: 160, height: 48, iconSize: 32 },
    lg: { width: 200, height: 60, iconSize: 40 },
  };

  const currentSize = sizes[size];

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      {variant === 'full' ? (
        <Image
          src="/images/iskala-logo.png"
          alt="iSkala Business Solutions"
          width={currentSize.width}
          height={currentSize.height}
          className={`h-${
            size === 'sm' ? '9' : size === 'md' ? '12' : '15'
          } w-auto ${white ? 'brightness-0 invert' : ''}`}
          priority
        />
      ) : (
        <>
          <Image
            src="/images/iskala-icon.png"
            alt="iSkala"
            width={currentSize.iconSize}
            height={currentSize.iconSize}
            className={`h-${
              size === 'sm' ? '6' : size === 'md' ? '8' : '10'
            } w-auto ${white ? 'brightness-0 invert' : ''}`}
            priority
          />
          {showText && (
            <span
              className={`${white ? 'text-white' : 'text-gray-900'} font-bold ${
                size === 'sm'
                  ? 'text-lg'
                  : size === 'md'
                  ? 'text-xl'
                  : 'text-2xl'
              }`}
            >
              iSkala Enrich
            </span>
          )}
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
