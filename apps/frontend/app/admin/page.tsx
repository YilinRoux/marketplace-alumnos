import RoleGuard from "../components/guards/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard minRole="superadmin">
      <div>
        <h1>Panel de Administración</h1>
        {/* Supervisión para personal autorizado */}
      </div>
    </RoleGuard>
  );
}
