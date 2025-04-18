// src/app/profile/page.tsx

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
  Alert,
  Tooltip
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import RefreshIcon from "@mui/icons-material/Refresh";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import InfoIcon from "@mui/icons-material/Info";
import CardGrid from "@/app/components/CardGrid";
import { PokemonCard, User, UpdateProfileData } from "@/app/lib/api/types";
import SetSearchbar from "@/app/components/SetSearchbar";
import CardFilters from "@/app/components/CardFilters";
import { Search } from "lucide-react";
import { getCardPrice } from "@/app/lib/sortUtils";

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
  const { user: authUser, isAuthenticated, loading: authLoading, updateProfile, refreshUser } = useAuth();
  const { collections, loading: collectionsLoading } = useCollection();
  const { t } = useLanguage();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [pokemonCards, setPokemonCards] = useState<CollectionPokemonCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<CollectionPokemonCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState("number-asc");
  const [selectedType, setSelectedType] = useState("All Types");
  const [collectionValue, setCollectionValue] = useState<number | null>(null);
  const [isCalculatingValue, setIsCalculatingValue] = useState(false);
  
  // Profile editing state
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [profileEmail, setProfileEmail] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add a local user state that we can update immediately
  const [user, setUser] = useState<User | null>(null);

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
    setSearchTerm(''); // Reset search when collection changes
    
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

  // Filter cards based on search term and type
  useEffect(() => {
    if (!pokemonCards.length) {
      setFilteredCards([]);
      return;
    }
    
    // Start with all cards
    let filtered = [...pokemonCards];
    
    // Filter by search term if exists
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(card => {
        return (
          card.name.toLowerCase().includes(searchTermLower) ||
          card.id.toLowerCase().includes(searchTermLower) ||
          card.number.toLowerCase().includes(searchTermLower) ||
          (card.types && card.types.some(type => type.toLowerCase().includes(searchTermLower))) ||
          (card.subtypes && card.subtypes.some(subtype => subtype.toLowerCase().includes(searchTermLower))) ||
          (card.rarity && card.rarity.toLowerCase().includes(searchTermLower))
        );
      });
    }
    
    // Filter by type if not "All Types"
    if (selectedType !== "All Types") {
      filtered = filtered.filter(card => 
        card.types && card.types.includes(selectedType)
      );
    }
    
    // Sort the filtered cards
    const sortCards = (cards: CollectionPokemonCard[], sortOption: string): CollectionPokemonCard[] => {
      const [field, direction] = sortOption.split('-');
      const multiplier = direction === 'asc' ? 1 : -1;
      
      return [...cards].sort((a, b) => {
        if (field === 'number') {
          // Parse card numbers and compare them numerically
          const aNum = parseInt(a.number.replace(/\D/g, '')) || 0;
          const bNum = parseInt(b.number.replace(/\D/g, '')) || 0;
          return multiplier * (aNum - bNum);
        } 
        else if (field === 'name') {
          return multiplier * a.name.localeCompare(b.name);
        } 
        else if (field === 'price') {
          const aPrice = a.cardmarket?.prices?.averageSellPrice || 
                        a.cardmarket?.prices?.trendPrice || 0;
          const bPrice = b.cardmarket?.prices?.averageSellPrice || 
                        b.cardmarket?.prices?.trendPrice || 0;
          return multiplier * (aPrice - bPrice);
        } 
        else if (field === 'rarity') {
          const rarityOrder: Record<string, number> = {
            'Common': 1,
            'Uncommon': 2,
            'Rare': 3,
            'Rare Holo': 4,
            'Rare Ultra': 5,
            'Rare Holo GX': 6,
            'Rare Secret': 7
          };
          const aRarityOrder = rarityOrder[a.rarity || ''] || 0;
          const bRarityOrder = rarityOrder[b.rarity || ''] || 0;
          return multiplier * (aRarityOrder - bRarityOrder);
        }
        
        return 0;
      });
    };
    
    // Apply sorting
    const sortedAndFiltered = sortCards(filtered, sortOption);
    
    setFilteredCards(sortedAndFiltered);
    setIsSearching(false);
  }, [pokemonCards, searchTerm, selectedType, sortOption]);

  // Update local user state whenever authUser changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Also need to add logic to clear image preview if changing user
  useEffect(() => {
    if (user) {
      console.log('Profile page detected user change');
      
      // Update the profile email when user data changes
      setProfileEmail(user.email || '');
      
      // Clear image preview if changing user
      setImagePreview(null);
      setProfileImage(null);
    }
  }, [user]);

  // Calculate collection value when pokemonCards change
  useEffect(() => {
    if (!pokemonCards.length) {
      setCollectionValue(null);
      return;
    }
    
    setIsCalculatingValue(true);
    
    try {
      let totalValue = 0;
      let cardCount = 0;
      
      pokemonCards.forEach(card => {
        // Get base price for the card
        const basePrice = getCardPrice(card);
        
        // Calculate value based on card quantity and variant
        if (card.collection && card.collection.variants) {
          const { variants } = card.collection;
          
          // Normal cards
          if (variants.normal > 0) {
            const normalPrice = card.tcgplayer?.prices?.normal?.market || basePrice;
            totalValue += normalPrice * variants.normal;
            cardCount += variants.normal;
          }
          
          // Holo cards (usually more valuable)
          if (variants.holo > 0) {
            const holoPrice = card.tcgplayer?.prices?.holofoil?.market || 
                             (basePrice * 1.5); // Estimate if no specific price
            totalValue += holoPrice * variants.holo;
            cardCount += variants.holo;
          }
          
          // Reverse holo cards
          if (variants.reverse_holo > 0) {
            const reverseHoloPrice = card.tcgplayer?.prices?.reverseHolofoil?.market || 
                                    (basePrice * 1.25); // Estimate if no specific price
            totalValue += reverseHoloPrice * variants.reverse_holo;
            cardCount += variants.reverse_holo;
          }
        }
      });
      
      setCollectionValue(totalValue);
    } catch (error) {
      console.error('Error calculating collection value:', error);
      setCollectionValue(null);
    } finally {
      setIsCalculatingValue(false);
    }
  }, [pokemonCards]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCollectionSelect = (collection: any) => {
    setSelectedCollection(collection);
  };

  const handleEditProfileOpen = () => {
    setProfileEmail(user?.email || '');
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
    setEditProfileDialogOpen(false);
    
    setUpdating(true);
    
    try {
      const updateData: UpdateProfileData = {
        email: profileEmail !== user?.email ? profileEmail : undefined
      };
      
      if (profileImage) {
        updateData.avatar = profileImage;
      }
      
      console.log('Updating profile with:', { 
        name: updateData.name,
        email: updateData.email, 
        hasAvatar: !!updateData.avatar 
      });
      
      // Check if email is being changed
      const emailBeingChanged = profileEmail !== user?.email && profileEmail.trim() !== '';
      
      // Immediately update local user state to reflect changes in UI
      if (user) {
        const immediatelyUpdatedUser = {
          ...user,
          // Only update the avatar preview immediately
          // For email changes, we'll show a pending status instead of immediately changing the email
        };
        setUser(immediatelyUpdatedUser);
      }
      
      const result = await updateProfile(updateData);
      console.log('Profile update result:', result);
  
      if (result.success || (result.message && result.message.toLowerCase().includes('success'))) {
        setProfileImage(null);
        setImagePreview(null);
        
        // Show appropriate message based on whether email was changed
        if (emailBeingChanged) {
          setUpdateMessage({
            type: 'success',
            message: 'Your profile was updated. A confirmation email has been sent to ' + profileEmail + ' from info@MoonDex.nl'
          });
        } else {
          setUpdateMessage({
            type: 'success',
            message: t("profile.updateSuccess") || 'Profile updated successfully'
          });
        }
      } else {
        if (authUser) {
          setUser(authUser);
        }
        
        setUpdateMessage({
          type: 'error',
          message: result.message || t("profile.updateError") || 'Failed to update profile'
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (authUser) {
        setUser(authUser);
      }
      
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

  const handleSearch = (term: string) => {
    // Only set searching state if there's an actual term
    if (term) {
      setIsSearching(true);
    }
    
    setSearchTerm(term);
    
    // Always reset the searching state after a short delay
    // This ensures the UI updates properly and prevents the input from freezing
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };
  
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
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
            {user?.pending_email && (
              <Box sx={{ 
                mt: 1, 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1, 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(245, 193, 66, 0.1)',
                border: '1px solid rgba(245, 193, 66, 0.3)'
              }}>
                <InfoIcon sx={{ color: 'warning.main', fontSize: '0.9rem' }} />
                <Typography variant="body2" sx={{ color: 'warning.main', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  Email change to {user.pending_email} pending confirmation
                </Typography>
              </Box>
            )}
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
                            <Typography variant="h6" sx={{ mb: 1 }}>{collection.name}</Typography>
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
                </Grid>
              </Box>

              {selectedCollection && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <CollectionsIcon sx={{ mr: 1 }} /> {selectedCollection.name}
                  </Typography>
                  
                  {/* Collection Value */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 1, 
                    backgroundColor: 'rgba(138, 63, 63, 0.05)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOnIcon sx={{ color: '#7FC99F' }} />
                      <Typography variant="body1" fontWeight="medium">
                        Collection Value:
                      </Typography>
                    </Box>
                    
                    {isCalculatingValue ? (
                      <CircularProgress size={20} thickness={5} sx={{ color: '#8A3F3F' }} />
                    ) : collectionValue !== null ? (
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#7FC99F' }}>
                        ${collectionValue.toFixed(2)}
                      </Typography>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No price data available
                      </Typography>
                    )}
                    
                    <Tooltip title="This value is calculated based on current market prices for each card in your collection, including variants like holofoil and reverse holofoil.">
                      <IconButton size="small" sx={{ ml: 'auto' }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
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
                    <>
                      <Box sx={{ 
                        mb: 3,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'flex-start' },
                        gap: 2
                      }}>
                        <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: '70%' } }}>
                          <SetSearchbar 
                            onSearch={handleSearch}
                            value={searchTerm}
                            placeholder={t("search.collection.placeholder") || "Search your collection..."}
                            isLoading={isSearching}
                          />
                          {searchTerm && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                              <Search size={16} style={{ color: '#8A3F3F', marginRight: '4px' }} />
                              <Typography variant="body2" color="text.secondary">
                                {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'} found for "{searchTerm}"
                              </Typography>
                              {searchTerm && (
                                <Button 
                                  size="small" 
                                  sx={{ ml: 2, color: '#8A3F3F' }}
                                  onClick={() => {
                                    // Clear the search term
                                    setSearchTerm('');
                                    // Immediately clear the searching state
                                    setIsSearching(false);
                                  }}
                                >
                                  Clear search
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                          width: { xs: '100%', sm: '30%' }
                        }}>
                          <CardFilters
                            value={sortOption}
                            onChange={handleSortChange}
                            selectedType={selectedType}
                            onTypeChange={handleTypeChange}
                          />
                        </Box>
                      </Box>
                      
                      {filteredCards.length === 0 ? (
                        <Box sx={{ textAlign: 'center', my: 4 }}>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {selectedType !== "All Types" 
                              ? `No ${selectedType} type cards found${searchTerm ? ` for "${searchTerm}"` : ""}`
                              : searchTerm 
                                ? `No cards found for "${searchTerm}"`
                                : "No cards found with the current filters"}
                          </Typography>
                          <Button 
                            variant="outlined"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedType('All Types');
                              setSortOption('number-asc');
                            }}
                            sx={{ 
                              borderColor: '#8A3F3F',
                              color: '#8A3F3F',
                              '&:hover': { 
                                borderColor: '#612B2B',
                                backgroundColor: 'rgba(138, 63, 63, 0.05)'
                              } 
                            }}
                          >
                            Reset Filters
                          </Button>
                        </Box>
                      ) : (
                        <CardGrid cards={filteredCards} baseRoute="/collections" collectionMode={true} />
                      )}
                      
                      {selectedType !== "All Types" && filteredCards.length > 0 && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Showing {filteredCards.length} {selectedType} type cards
                          </Typography>
                        </Box>
                      )}
                    </>
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
              {user?.pending_email && (
                <Typography component="span" sx={{ ml: 1, fontSize: '0.85rem', color: 'warning.main', fontStyle: 'italic' }}>
                  (Change to {user.pending_email} pending confirmation)
                </Typography>
              )}
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
          label={t("auth.email")}
          type="email"
          fullWidth
          variant="outlined"
          value={profileEmail}
          onChange={(e) => setProfileEmail(e.target.value)}
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