import { useNavigate  } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const goToCustomer = () => {
    navigate("/customers");
  };
  const goToExcel = () => {
    navigate("/excel");
  };
  return (
      <div>
          <h1>Trang chủ</h1>

          <button onClick={goToCustomer}>
              Đi tới trang Customer
          </button>
          <button onClick={goToExcel}>
              Đi tới trang Excel
          </button>
      </div>
  );
}

export default Home;