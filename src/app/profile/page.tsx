"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCollection } from "@/context/CollectionContext";
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
  CardActionArea
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import CardGrid from "@/app/components/CardGrid";
import { PokemonCard } from "@/app/lib/api/types";

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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { collections, loading: collectionsLoading } = useCollection();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [pokemonCards, setPokemonCards] = useState<CollectionPokemonCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCollectionSelect = (collection: any) => {
    setSelectedCollection(collection);
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
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80,
              background: 'linear-gradient(to bottom right, #8A3F3F, #612B2B)',
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            {user?.name?.[0] || 'U'}
          </Avatar>
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
              label="Collections" 
              {...a11yProps(0)} 
              sx={{ 
                '&.Mui-selected': { color: '#8A3F3F' },
                textTransform: 'none',
              }}
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Settings" 
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
              <Typography variant="h6" sx={{ mb: 2 }}>Your collected cards will be shown here</Typography>
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
                Start Collecting
              </Button> */}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Your Moondex</Typography>
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
                            <Typography variant="h6" sx={{ mb: 1 }}>Collected Cards</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {collection.cards.length} cards
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
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
                            Add Collection
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
                        Cards you have collected will be shown here!
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
                        Add Cards
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
          <Typography variant="h6" sx={{ mb: 3 }}>Account Settings</Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Profile Information
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Name: {user?.name || 'Not set'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Email: {user?.email || 'Not set'}
            </Typography>
            <Button 
              variant="outlined"
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
              Edit Profile
            </Button>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Account Security
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
              Change Password
            </Button>
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
} 