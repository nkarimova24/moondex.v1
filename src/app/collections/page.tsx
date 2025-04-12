"use client";

import { useState } from "react";
import { useCollection } from "@/context/CollectionContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Alert
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectionIcon from '@mui/icons-material/Collections';
import { useRouter } from "next/navigation";

export default function CollectionsPage() {
  const { collections, loading, error, createCollection, updateCollection, deleteCollection } = useCollection();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Dialog states
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Get selected collection details
  const getSelectedCollection = () => {
    if (selectedCollection === null) return null;
    return collections.find(c => c.id === selectedCollection) || null;
  };

  // Open edit dialog with pre-filled data
  const handleOpenEditDialog = (id: number) => {
    const collection = collections.find(c => c.id === id);
    if (collection) {
      setSelectedCollection(id);
      setName(collection.name);
      setDescription(collection.description || '');
      setOpenEditDialog(true);
    }
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedCollection(id);
    setOpenDeleteDialog(true);
  };

  // Reset form after dialog close
  const resetForm = () => {
    setName('');
    setDescription('');
    setFormError('');
    setSelectedCollection(null);
  };

  // Handle collection creation
  const handleCreateCollection = async () => {
    if (!name.trim()) {
      setFormError('Collection name is required');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const result = await createCollection(name, description);
      
      if (result) {
        resetForm();
        setOpenNewDialog(false);
      } else {
        setFormError('Failed to create collection');
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      setFormError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle collection update
  const handleUpdateCollection = async () => {
    if (!name.trim() || selectedCollection === null) {
      setFormError('Collection name is required');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const result = await updateCollection(selectedCollection, name, description);
      
      if (result) {
        resetForm();
        setOpenEditDialog(false);
      } else {
        setFormError('Failed to update collection');
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      setFormError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle collection deletion
  const handleDeleteCollection = async () => {
    if (selectedCollection === null) return;

    setFormLoading(true);

    try {
      const result = await deleteCollection(selectedCollection);
      
      if (result) {
        setOpenDeleteDialog(false);
        setSelectedCollection(null);
      } else {
        setFormError('Failed to delete collection');
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      setFormError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // View collection details
  const handleViewCollection = (id: number) => {
    router.push(`/collections/${id}`);
  };
  
  // Render UI
  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" color="white" fontWeight="bold">
          My Collections
        </Typography>
        
        {isAuthenticated && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenNewDialog(true)}
            sx={{ 
              backgroundColor: "#8A3F3F",
              "&:hover": { backgroundColor: "#6E2F2F" }
            }}
          >
            New Collection
          </Button>
        )}
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress sx={{ color: "#8A3F3F" }} />
        </Box>
      ) : (
        <>
          {/* Not authenticated message */}
          {!isAuthenticated ? (
            <Card sx={{ bgcolor: '#252525', color: 'white', p: 2, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sign in to track your collection
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Create an account to keep track of your Pokémon card collection, organize your cards, and more!
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    component={Link} 
                    href="/signin" 
                    variant="contained"
                    sx={{ 
                      mr: 2, 
                      backgroundColor: "#8A3F3F",
                      "&:hover": { backgroundColor: "#6E2F2F" }
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    component={Link} 
                    href="/signup" 
                    variant="outlined"
                    sx={{ 
                      borderColor: "#8A3F3F", 
                      color: "#8A3F3F",
                      "&:hover": { 
                        borderColor: "#6E2F2F", 
                        backgroundColor: "rgba(138, 63, 63, 0.1)" 
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : collections.length === 0 ? (
            // Empty state
            <Card sx={{ bgcolor: '#252525', color: 'white', p: 2, mb: 4 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CollectionIcon sx={{ fontSize: 60, color: '#8A3F3F', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" gutterBottom>
                  You don't have any collections yet
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
                  Collections help you organize your Pokémon cards. Create your first collection to start tracking your cards!
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setOpenNewDialog(true)}
                  sx={{ 
                    backgroundColor: "#8A3F3F",
                    "&:hover": { backgroundColor: "#6E2F2F" }
                  }}
                >
                  Create Your First Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Collections grid
            <Grid container spacing={3}>
              {collections.map(collection => (
                <Grid item xs={12} sm={6} md={4} key={collection.id}>
                  <Card 
                    sx={{ 
                      bgcolor: '#252525', 
                      color: 'white',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                          {collection.name}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(collection.id);
                              }}
                              sx={{ color: 'white' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(collection.id);
                              }}
                              sx={{ color: 'white' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ color: '#aaa', mb: 2 }}>
                        {collection.description || 'No description'}
                      </Typography>
                      
                      <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ color: '#aaa' }}>
                          {collection.cards.length} {collection.cards.length === 1 ? 'card' : 'cards'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ color: '#aaa' }}>
                          Created {new Date(collection.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Button 
                      fullWidth
                      onClick={() => handleViewCollection(collection.id)}
                      sx={{ 
                        mt: 'auto',
                        color: 'white',
                        backgroundColor: "rgba(138, 63, 63, 0.6)",
                        borderRadius: 0,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: "rgba(138, 63, 63, 0.8)",
                        }
                      }}
                    >
                      View Collection
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Dialog for creating a new collection */}
      <Dialog 
        open={openNewDialog} 
        onClose={() => {
          setOpenNewDialog(false);
          resetForm();
        }}
        PaperProps={{
          style: {
            backgroundColor: '#2A2A2A',
            color: 'white',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputLabelProps={{ style: { color: '#aaa' } }}
            InputProps={{ style: { color: 'white' } }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8A3F3F' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputLabelProps={{ style: { color: '#aaa' } }}
            InputProps={{ style: { color: 'white' } }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8A3F3F' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpenNewDialog(false);
              resetForm();
            }}
            sx={{ color: '#aaa' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCollection}
            variant="contained"
            disabled={formLoading}
            sx={{ 
              backgroundColor: "#8A3F3F",
              "&:hover": { backgroundColor: "#6E2F2F" }
            }}
          >
            {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for editing a collection */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => {
          setOpenEditDialog(false);
          resetForm();
        }}
        PaperProps={{
          style: {
            backgroundColor: '#2A2A2A',
            color: 'white',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputLabelProps={{ style: { color: '#aaa' } }}
            InputProps={{ style: { color: 'white' } }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8A3F3F' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputLabelProps={{ style: { color: '#aaa' } }}
            InputProps={{ style: { color: 'white' } }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8A3F3F' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpenEditDialog(false);
              resetForm();
            }}
            sx={{ color: '#aaa' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCollection}
            variant="contained"
            disabled={formLoading}
            sx={{ 
              backgroundColor: "#8A3F3F",
              "&:hover": { backgroundColor: "#6E2F2F" }
            }}
          >
            {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for deleting a collection */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedCollection(null);
        }}
        PaperProps={{
          style: {
            backgroundColor: '#2A2A2A',
            color: 'white',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle>Delete Collection</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete{' '}
            <strong>{getSelectedCollection()?.name}</strong>?
            This action cannot be undone.
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpenDeleteDialog(false);
              setSelectedCollection(null);
            }}
            sx={{ color: '#aaa' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCollection}
            variant="contained"
            disabled={formLoading}
            sx={{ 
              backgroundColor: "rgb(211, 47, 47)",
              "&:hover": { backgroundColor: "rgb(178, 34, 34)" }
            }}
          >
            {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );