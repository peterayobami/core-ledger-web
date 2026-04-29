import { Building2 } from "lucide-react";
import { avatarPalette, initials } from "@/lib/format";

interface AvatarProps {
    name: string;
    size?: number;
    variant?: "individual" | "organization";
    imageUrl?: string | null;
}

export function Avatar({ name, size = 36, variant = "individual", imageUrl }: AvatarProps) {
    const palette = avatarPalette(name);
    const isOrg = variant === "organization";
    const radius = isOrg ? 10 : 9999;

    const baseStyle = {
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: imageUrl ? "transparent" : palette.bg,
        color: palette.fg,
    } as const;

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                style={baseStyle}
                className="object-cover shrink-0"
            />
        );
    }

    return (
        <div
            style={baseStyle}
            className="flex items-center justify-center shrink-0 font-semibold"
        >
            {isOrg ? (
                <Building2 size={size * 0.5} strokeWidth={1.8} />
            ) : (
                <span style={{ fontSize: size * 0.36 }}>{initials(name)}</span>
            )}
        </div>
    );
}
