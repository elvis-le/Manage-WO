import { createContext, useState, useEffect, useContext } from "react";
import { getWorkOrders } from "../services/dashboardService";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

export const DataContext = createContext();

export function DataProvider({ children }) {
    const { user } = useContext(AuthContext); // Lấy trạng thái user từ Auth
    const [rows, setRows] = useState([]);
    const [productivityData, setProductivityData] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Effect này chạy NGAY LẬP TỨC khi user có dữ liệu (đã đăng nhập hoặc reload lại trang khi đã có token)
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            // Nếu đăng xuất, xóa trắng dữ liệu để bảo mật
            setRows([]);
            setProductivityData([]);
            setLoadingData(false);
        }
    }, [user]);

    // useEffect(() => {
    //     fetchData();
    // }, []);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const workOrdersPromise = getWorkOrders().catch(err => {
                console.error("Lỗi khi tải dữ liệu WO:", err);
                return { data: { rows: [] } }; // Trả về mảng rỗng nếu lỗi
            });

            // 2. Gọi API Năng suất dùng đúng instance 'api' (Có bọc catch)
            const productivityPromise = api.get("/admin/dashboard_productivity/").catch(err => {
                console.error("Lỗi khi tải dữ liệu Năng suất:", err);
                return { data: { success: false, data: [] } };
            });

            // 3. Chạy song song cả 2 (Bây giờ đã tuyệt đối an toàn)
            const [woRes, prodRes] = await Promise.all([workOrdersPromise, productivityPromise]);

            // Nạp dữ liệu vào State
            setRows(woRes.data?.rows || []);

            if (prodRes.data?.success) {
                setProductivityData(prodRes.data.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu Dashboard:", err);
        } finally {
            setLoadingData(false);
        }
    };

    return (
        <DataContext.Provider value={{rows, productivityData, loadingData, refreshData: fetchData}}>
            {children}
        </DataContext.Provider>
    );
}