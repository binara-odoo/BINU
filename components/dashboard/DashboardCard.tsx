interface DashboardCardProps {
    icon: string;
    title: string;
    href: string;
}

export default function DashboardCard({ icon, title, href }: DashboardCardProps) {
    return (
        <a href={href} class="block">
            <div class="dashboard-card">
                <h3 class="dashboard-card-title">
                    {title}
                </h3>
                <div class="dashboard-card-bar">
                    <div class="dashboard-card-emptybar"></div>
                </div>
                <div class="dashboard-card-icon">
                    <img src={icon} alt={title} />
                </div>
            </div>
        </a>
    );
}