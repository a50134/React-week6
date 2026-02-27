import { Outlet, Link } from "react-router-dom";

function FrontendLayout() {
    return(
         <>
      <header>
       <nav className="mt-5">
          <Link className="h4 mt-5 mx-2" to="/">
            首頁
          </Link>
          <Link className="h4 mt-5 mx-2" to="/product">
            產品頁面
          </Link>
          <Link className="h4 mt-5 mx-2" to="/cart">
            購物車
          </Link>
          <Link className="h4 mt-5 mx-2" to="/checkout">
            結帳
          </Link>
          <Link className="h4 mt-5 mx-2" to="/login">
            登入
          </Link>
        </nav>
      </header>

      <main>
        <Outlet /> {/* 子頁面（Home / Cart）會顯示在這裡 */}
      </main>
    </>
    )
}

export default FrontendLayout;