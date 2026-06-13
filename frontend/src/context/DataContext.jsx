import { createContext, useState, useEffect, useContext } from "react";
import { getWorkOrders } from "../services/dashboardService";
import { AuthContext } from "./AuthContext";

export const DataContext = createContext();

export function DataProvider({ children }) {
    const { user } = useContext(AuthContext); // Lấy trạng thái user từ Auth
    const [rows, setRows] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Effect này chạy NGAY LẬP TỨC khi user có dữ liệu (đã đăng nhập hoặc reload lại trang khi đã có token)
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            // Nếu đăng xuất, xóa trắng dữ liệu để bảo mật
            setRows([]);
            setLoadingData(false);
        }
    }, [user]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const res = await getWorkOrders();
            setRows(res.data.rows || []);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu Dashboard:", err);
        } finally {
            setLoadingData(false);
        }
    };

    return (
        <DataContext.Provider value={{ rows, loadingData, refreshData: fetchData }}>
            {children}
        </DataContext.Provider>
    );
}