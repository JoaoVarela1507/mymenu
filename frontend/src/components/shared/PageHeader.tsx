interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-secondary py-8 px-4 shadow-lg">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {icon && <span className="text-4xl">{icon}</span>}
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-secondary/90 text-sm max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
