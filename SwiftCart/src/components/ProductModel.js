// src/components/ProductModal.js
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Rating,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ProductModal({ open, onClose, product }) {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={600}>
          {product.title}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ textAlign: "center" }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ maxHeight: 200, objectFit: "contain" }}
          />
        </Box>
        <Typography variant="body1" mt={2}>
          {product.description}
        </Typography>
        <Typography variant="subtitle2" mt={2} color="text.secondary">
          Category: {product.category}
        </Typography>
        <Box mt={2} display="flex" alignItems="center" gap={1}>
          <Rating
            name="product-rating"
            value={product.rating?.rate || 0}
            precision={0.1}
            readOnly
          />
          <Typography variant="body2">
            ({product.rating?.count} reviews)
          </Typography>
        </Box>
        <Typography variant="h6" color="primary" mt={2}>
          ₹ {product.price}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default ProductModal;
