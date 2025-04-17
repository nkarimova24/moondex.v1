"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useAuth, getUserAvatarUrl } from "@/context/AuthContext";
import { useCollection } from "@/context/CollectionContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Container,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import RefreshIcon from "@mui/icons-material/Refresh";
import CardGrid from "@/app/components/CardGrid";
import { PokemonCard, User, UpdateProfileData } from "@/app/lib/api/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CollectionPokemonCard extends PokemonCard {
  collection?: {
    id: number;
    quantity: number;
    is_foil: boolean;
    is_reverse_holo: boolean;
    collection_id: number;
    variants: Record<string, number>;
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const { collections, loading: collectionsLoading } = useCollection();
  const { t } = useLanguage();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [pokemonCards, setPokemonCards] = useState<CollectionPokemonCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  
  // Profile editing state
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (collections.length > 0 && !selectedCollection) {
      setSelectedCollection(collections[0]);
    }
  }, [collections, selectedCollection]);

  useEffect(() => {
    if (!selectedCollection) return;
    
    setLoadingCards(true);
    
    const fetchCardDetails = async () => {
      try {
        const cardIds = selectedCollection.cards.map((card: any) => card.card_id);
        const uniqueCardIds = [...new Set(cardIds)];
        
        if (uniqueCardIds.length === 0) {
          setPokemonCards([]);
          setLoadingCards(false);
          return;
        }
        
        const cardsWithQuantities: CollectionPokemonCard[] = [];
        
        for (const currentCardId of uniqueCardIds) {
          try {
            const response = await fetch(`https://api.pokemontcg.io/v2/cards/${currentCardId}`);
            if (!response.ok) {
              console.warn(`Failed to fetch card ${currentCardId}:`, response.status);
              continue;
            }
            const data = await response.json();
            
            const collectionCards = selectedCollection.cards.filter(
              (card: any) => card.card_id === currentCardId
            );
            
            const variants: Record<string, number> = {
              normal: 0,
              holo: 0,
              reverse_holo: 0
            };
            
            collectionCards.forEach((collectionCard: any) => {
              if (collectionCard.is_reverse_holo) {
                variants.reverse_holo += collectionCard.quantity;
              } else if (collectionCard.is_foil) {
                variants.holo += collectionCard.quantity;
              } else {
                variants.normal += collectionCard.quantity;
              }
            });
            
            const enrichedCard: CollectionPokemonCard = {
              ...data.data,
              collection: {
                id: collectionCards[0].id,
                quantity: Object.values(variants).reduce((a, b) => a + b, 0),
                is_foil: variants.holo > 0,
                is_reverse_holo: variants.reverse_holo > 0,
                collection_id: selectedCollection.id,
                variants: variants
              }
            };
            
            cardsWithQuantities.push(enrichedCard);
          } catch (cardError) {
            console.error(`Failed to fetch card ${currentCardId}:`, cardError);
          }
        }
        
        setPokemonCards(cardsWithQuantities);
      } catch (err) {
        console.error('Error fetching card details:', err);
      } finally {
        setLoadingCards(false);
      }
    };
    
    fetchCardDetails();
  }, [selectedCollection?.id]);

  useEffect(() => {
    if (user) {
      console.log('Profile page detected user change');
      
      // Update the profile name when user data changes
      setProfileName(user.name || '');
      
      // Clear image preview if changing user
      setImagePreview(null);
      setProfileImage(null);
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCollectionSelect = (collection: any) => {
    setSelectedCollection(collection);
  };

  const handleEditProfileOpen = () => {
    setProfileName(user?.name || '');
    setProfileImage(null);
    setImagePreview(null);
    setEditProfileDialogOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditProfileDialogOpen(false);
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      // Create update data with optional avatar
      const updateData: UpdateProfileData = {
        name: profileName
      };
      
      // Only include avatar if a new one was selected
      if (profileImage) {
        updateData.avatar = profileImage;
      }
      
      console.log('Updating profile with:', { 
        name: updateData.name, 
        hasAvatar: !!updateData.avatar 
      });
      
      const result = await updateProfile(updateData);

      if (result.success) {
        // Clear the preview after successful update
        setProfileImage(null);
        setImagePreview(null);
        
        // Show success message
        setUpdateMessage({
          type: 'success',
          message: t("profile.updateSuccess") || 'Profile updated successfully'
        });
        handleEditProfileClose();
      } else {
        setUpdateMessage({
          type: 'error',
          message: result.message || t("profile.updateError") || 'Failed to update profile'
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage({
        type: 'error',
        message: t("profile.updateError") || 'Failed to update profile'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseMessage = () => {
    setUpdateMessage(null);
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2, background: 'linear-gradient(to right, rgba(138, 63, 63, 0.05), rgba(138, 63, 63, 0.15))' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={getUserAvatarUrl(user)}
              sx={{ 
                width: 80, 
                height: 80,
                background: 'linear-gradient(to bottom right, #8A3F3F, #612B2B)',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab 
              icon={<CollectionsIcon />} 
              label={t("profile.collections")} 
              {...a11yProps(0)} 
              sx={{ 
                '&.Mui-selected': { color: '#8A3F3F' },
                textTransform: 'none',
              }}
            />
            <Tab 
              icon={<SettingsIcon />} 
              label={t("profile.settings")} 
              {...a11yProps(1)} 
              sx={{ 
                '&.Mui-selected': { color: '#8A3F3F' },
                textTransform: 'none',
              }}
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {collectionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : collections.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{t("profile.collectionsEmpty")}</Typography>
              {/* <Button 
                variant="contained" 
                component={Link} 
                href="/collections" 
                startIcon={<AddIcon />}
                sx={{ 
                  backgroundColor: '#8A3F3F',
                  '&:hover': { backgroundColor: '#612B2B' }
                }}
              >
                {t("profile.createFirstCollection")}
              </Button> */}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t("profile.myCollections")}</Typography>
                <Grid container spacing={2}>
                  {collections.map((collection) => (
                    <Grid item xs={12} sm={6} md={4} key={collection.id}>
                      <Card 
                        elevation={selectedCollection?.id === collection.id ? 4 : 1}
                        sx={{ 
                          border: selectedCollection?.id === collection.id ? '2px solid #8A3F3F' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <CardActionArea onClick={() => handleCollectionSelect(collection)}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>{t("collection.title")}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {collection.cards.length} {t("set.cards").toLowerCase()}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                  
                  {/* Coming soon - Lists */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        opacity: 0.7,
                        background: 'rgba(138, 63, 63, 0.02)',
                        border: '1px dashed rgba(138, 63, 63, 0.2)',
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                          {t("profile.comingSoon")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("profile.lists")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Coming soon - Decks */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        opacity: 0.7,
                        background: 'rgba(138, 63, 63, 0.02)',
                        border: '1px dashed rgba(138, 63, 63, 0.2)',
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                          {t("profile.comingSoon")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("profile.decks")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(138, 63, 63, 0.05)',
                        border: '1px dashed rgba(138, 63, 63, 0.3)',
                        p: 3
                      }}
                    >
                      <CardActionArea component={Link} href="/collections" sx={{ height: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <AddIcon sx={{ fontSize: 40, color: 'rgba(138, 63, 63, 0.5)', mb: 1 }} />
                          <Typography variant="body1" sx={{ color: 'rgba(138, 63, 63, 0.7)' }}>
                            {t("profile.addCollection")}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid> */}
                </Grid>
              </Box>

              {selectedCollection && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <CollectionsIcon sx={{ mr: 1 }} /> {selectedCollection.name}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {loadingCards ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : pokemonCards.length === 0 ? (
                    <Box sx={{ textAlign: 'center', my: 4 }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {t("collection.empty")}
                      </Typography>
                      <Button 
                        variant="contained" 
                        component={Link} 
                        href={`/collections/${selectedCollection.id}`}
                        sx={{ 
                          backgroundColor: '#8A3F3F',
                          '&:hover': { backgroundColor: '#612B2B' }
                        }}
                      >
                        {t("collection.addFirst")}
                      </Button>
                    </Box>
                  ) : (
                    <CardGrid cards={pokemonCards} baseRoute="/collections" collectionMode={true} />
                  )}
                </Box>
              )}
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 3 }}>{t("profile.settings")}</Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              {t("profile.editProfile")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {t("auth.username")}: {user?.name || 'Not set'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {t("auth.email")}: {user?.email || 'Not set'}
            </Typography>
            <Button 
              variant="outlined"
              onClick={handleEditProfileOpen}
              startIcon={<EditIcon />}
              sx={{ 
                mt: 2,
                borderColor: '#8A3F3F',
                color: '#8A3F3F',
                '&:hover': { 
                  borderColor: '#612B2B',
                  backgroundColor: 'rgba(138, 63, 63, 0.05)'
                } 
              }}
            >
              {t("profile.editProfile")}
            </Button>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              {t("profile.accountSecurity")}
            </Typography>
            <Button 
              variant="outlined"
              sx={{ 
                borderColor: '#8A3F3F',
                color: '#8A3F3F',
                '&:hover': { 
                  borderColor: '#612B2B',
                  backgroundColor: 'rgba(138, 63, 63, 0.05)'
                } 
              }}
            >
              {t("profile.changePassword")}
            </Button>
          </Paper>
        </TabPanel>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialogOpen} onClose={handleEditProfileClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("profile.editProfile")}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3, mt: 1 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={imagePreview || getUserAvatarUrl(user)}
                onClick={handleProfileImageClick}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'linear-gradient(to bottom right, #8A3F3F, #612B2B)',
                  border: '4px solid rgba(138, 63, 63, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                size="small"
                onClick={handleProfileImageClick}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#8A3F3F',
                  color: 'white',
                  '&:hover': {
                    background: '#612B2B',
                  }
                }}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              {t("profile.clickToUpload")}
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label={t("auth.username")}
            type="text"
            fullWidth
            variant="outlined"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            sx={{ mb: 3 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleEditProfileClose}
            sx={{ color: 'text.secondary' }}
          >
            {t("button.cancel")}
          </Button>
          <Button 
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={updating}
            sx={{
              backgroundColor: '#8A3F3F',
              '&:hover': {
                backgroundColor: '#612B2B',
              }
            }}
          >
            {updating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("button.save")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Message */}
      {updateMessage && (
        <Snackbar 
          open={true} 
          autoHideDuration={6000} 
          onClose={handleCloseMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseMessage} 
            severity={updateMessage.type} 
            sx={{ width: '100%' }}
          >
            {updateMessage.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
} 