import { Outlet, Link } from "react-router-dom";

function AdminLayout() {
  return (
    <>
      <header>
        <nav className="mt-5">
          <Link className="h4 mt-5 mx-2" to="/admin/product">
            後臺產品頁面
          </Link>
          <Link className="h4 mt-5 mx-2" to="/admin/order">
            後臺訂單頁面
          </Link>
        </nav>
      </header>

      <main>
        <Outlet /> {/* 子頁面（Home / Cart）會顯示在這裡 */}
      </main>
    </>
  );
}

export default AdminLayout;
