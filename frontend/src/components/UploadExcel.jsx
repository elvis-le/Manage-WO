import {Upload, Button, message} from "antd";
import {UploadOutlined} from "@ant-design/icons";

import {uploadDashboard} from "../services/dashboardService";

function UploadExcel({setRows}) {
    const props = {
        beforeUpload: async (file) => {
            try {
                const res = await uploadDashboard(file);

                setRows(res.data.rows);

                message.success(
                    "Upload thành công"
                );
            } catch (err) {
                console.error(err);

                message.error(
                    "Upload thất bại"
                );
            }

            return false;
        },
    };

    return (
        <Upload {...props}>
            <Button icon={<UploadOutlined/>}>
                Upload Excel
            </Button>
        </Upload>
    );
}

export default UploadExcel;
