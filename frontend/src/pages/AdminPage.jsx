import { useState, useEffect } from "react";
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Typography } from "antd";
import { UserAddOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, KeyOutlined, LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import UploadExcel from "../components/UploadExcel";

// === MỚI THÊM: Import component UploadProductivity ===
import UploadProductivity from "../components/UploadProductivity";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const { Title } = Typography;

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { logout } = useContext(AuthContext);

  const [form] = Form.useForm();
  const [passForm] = Form.useForm();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users/");
      setUsers(res.data.users);
    } catch (err) {
      message.error("Không thể tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (values) => {
    try {
      await api.post("/admin/users/", values);
      message.success("Tạo tài khoản mới thành công!");
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.error || "Lỗi khi tạo tài khoản!");
    }
  };

  const handleLockUnlock = async (userId, isCurrentlyActive) => {
    try {
      await api.put(`/admin/users/${userId}/`, { action: isCurrentlyActive ? "lock" : "unlock" });
      message.success(isCurrentlyActive ? "Đã khoá tài khoản!" : "Đã kích hoạt lại tài khoản!");
      fetchUsers();
    } catch (err) {
      message.error("Thao tác thất bại!");
    }
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: "Bạn có chắc chắn muốn xoá vĩnh viễn tài khoản này?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await api.delete(`/admin/users/${userId}/`);
          message.success("Xoá tài khoản thành công!");
          fetchUsers();
        } catch (err) {
          message.error(err.response?.data?.error || "Không thể xoá tài khoản!");
        }
      },
    });
  };

  const handleChangePassword = async (values) => {
    try {
      await api.put(`/admin/users/${selectedUserId}/`, { action: "change_password", new_password: values.new_password });
      message.success("Đổi mật khẩu tài khoản thành công!");
      setIsPassModalOpen(false);
      passForm.resetFields();
    } catch (err) {
      message.error("Lỗi khi đổi mật khẩu!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên tài khoản", dataIndex: "username", key: "username" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={role === "admin" ? "gold" : "blue"}>{role.toUpperCase()}</Tag>
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Đang hoạt động" : "Đang khoá"}</Tag>
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={record.is_active ? <LockOutlined style={{color: '#faad14'}} /> : <UnlockOutlined style={{color: '#52c41a'}} />}
            onClick={() => handleLockUnlock(record.id, record.is_active)}
          >
            {record.is_active ? "Khoá" : "Mở"}
          </Button>
          <Button
            type="text"
            icon={<KeyOutlined style={{color: '#1677ff'}} />}
            onClick={() => { setSelectedUserId(record.id); setIsPassModalOpen(true); }}
          >
            Đổi mật khẩu
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            Xoá
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2}>Hệ Thống Quản Trị Hệ Thống</Title>
        <Space>
          <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>Xem Dashboard</Button>
          <Button danger icon={<LogoutOutlined />} onClick={() => { logout(); navigate("/login"); }}>Đăng xuất</Button>
        </Space>
      </div>

      <Card title="Cập nhật Dữ liệu Work Order từ Excel" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Chọn file báo cáo mới nhất để đồng bộ hệ thống:</span>
          {/* Mock tạm setRows vì sau khi upload Admin có thể điều hướng về trang chủ */}
          <UploadExcel setRows={() => { message.info("Dữ liệu đã được nạp lên máy chủ!"); }} />
        </div>
      </Card>

      {/* === MỚI THÊM: Khu vực upload file năng suất FTNT === */}
      <UploadProductivity onSuccess={() => { message.info("Đã đồng bộ dữ liệu năng suất!"); }} />

      <Card
        title="Quản Lý Tài Khoản Khách (Users)"
        extra={<Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsCreateModalOpen(true)}>Tạo tài khoản</Button>}
      >
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
      </Card>

      {/* MODAL TẠO USER MỚI */}
      <Modal title="Tạo tài khoản mới" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreateUser} layout="vertical">
          <Form.Item name="username" label="Tên tài khoản" rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Phân quyền" defaultValue="user">
            <Select options={[{ value: "user", label: "User (Chỉ xem)" }, { value: "admin", label: "Admin (Toàn quyền)" }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal title="Đổi mật khẩu tài khoản" open={isPassModalOpen} onCancel={() => setIsPassModalOpen(false)} onOk={() => passForm.submit()}>
        <Form form={passForm} onFinish={handleChangePassword} layout="vertical">
          <Form.Item name="new_password" label="Mật khẩu mới" rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }, { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminPage;