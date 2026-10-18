import AuthLayout from "@/components/auth/AuthLayout"
import LoginForm from "@/components/auth/LoginForm"

export const metadata = {
  title: "Iniciar sesión | Quokka",
  description: "Ingresá a tu cuenta de Quokka.",
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Ingresá tus credenciales para continuar."
    >
      <LoginForm />
    </AuthLayout>
  )
}
