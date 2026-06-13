import { useState, useContext } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const userData = await login(values.username, values.password);
      message.success("Đăng nhập thành công!");
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#070b14" }}>
      <Card title={<span style={{ color: "#1677ff", fontSize: 20 }}>HỆ THỐNG WORK ORDER</span>} style={{ width: 400, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <Form name="login_form" onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Tài khoản" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;