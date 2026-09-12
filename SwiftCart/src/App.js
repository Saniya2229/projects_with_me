import { useState } from "react";
import { ThemeProvider, CssBaseline, Container } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import CartDrawer from "./components/CartDrawer";

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar onCartClick={() => setCartOpen(true)} cartCount={cart.length} />

      <Container sx={{ mt: 4 }}>
        <ProductList cart={cart} setCart={setCart} />
      </Container>
      <CartDrawer
        open={isCartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </ThemeProvider>
  );
}

export default App;
