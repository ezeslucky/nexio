import { Content, P, Template, Title } from './components';

export default function TestMail() {
  return (
    <Template>
      <Title>Test Email from Nexio</Title>
      <Content>
        <P>This is a test email from your Nexio instance.</P>
      </Content>
    </Template>
  );
}
