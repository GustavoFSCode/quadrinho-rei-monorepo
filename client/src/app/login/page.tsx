"use client";

import {
  Container,
  Content,
  AdminArea,
} from "./styled";

import LoginForm from "@/components/Forms/LoginForm/LoginForm";

export default function LoginPage() {

  return (
    <Container>
      <Content>
        <AdminArea>Quadrinhos Rei</AdminArea>
        <p>Informe seus dados para continuar</p>
        <LoginForm/>
      </Content>
    </Container>
  );
}
