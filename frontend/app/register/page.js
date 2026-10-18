import AuthLayout from "@/components/auth/AuthLayout"
import RegisterForm from "@/components/auth/RegisterForm"

export const metadata = {
  title: "Crear cuenta | Quokka",
  description: "Registrate en Quokka para empezar a explorar.",
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Completá el formulario para unirte a Quokka."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
