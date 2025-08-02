// src/components/ProductCard.js
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";

function ProductCard({ product, onAddToCart, onViewDetails }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 3,
        boxShadow: 4,
        backgroundColor: "#FAF3E0",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={product.image}
        alt={product.title}
        sx={{
          height: 180,
          objectFit: "contain",
          p: 2,
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {product.title.length > 40
            ? product.title.slice(0, 40) + "..."
            : product.title}
        </Typography>
        <Typography variant="h6" color="primary">
          ₹ {product.price}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={onAddToCart}
          sx={{
            fontWeight: 600,
            backgroundColor: "#FF6F61",
            "&:hover": {
              backgroundColor: "#e65a4f",
            },
          }}
        >
          Add to Cart
        </Button>
        <Button
          variant="outlined"
          fullWidth
          color="secondary"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;
