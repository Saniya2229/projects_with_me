// src/components/CartDrawer.js
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function CartDrawer({ open, onClose, cart, setCart }) {
  const handleRemove = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Your Cart
        </Typography>
        <Divider sx={{ my: 2 }} />
        {cart.length === 0 ? (
          <Typography>Your cart is empty.</Typography>
        ) : (
          cart.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box>
                <Typography fontWeight={500}>
                  {item.title.length > 25
                    ? item.title.slice(0, 25) + "..."
                    : item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹ {item.price}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleRemove(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          Total: ₹ {total}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled
        >
          Checkout (Coming Soon)
        </Button>
      </Box>
    </Drawer>
  );
}

export default CartDrawer;
