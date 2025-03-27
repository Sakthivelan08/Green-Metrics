import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import AuthManagerService from '@/services/AuthManagerService';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider } from '@mui/material/styles';
import { createCustomTheme } from '@/pages/PimStyles';
interface AppHeaderProps {
  accessData: any;
  navigationData: any;
  onDataEmit: (data: any) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ accessData, navigationData, onDataEmit }) => {
  const authManager = new AuthManagerService();
  const isAuthenticated = authManager.isAuthenticated();
  const user = isAuthenticated ? authManager.getUserData() : null;
  const username = user?.name || '';
  const initial = username ? username.charAt(0) : '';

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const pages = [
    // 'Activity',
    // 'Product',
    // 'Export',
    // 'metrics',
    // 'Entity',
    // 'Assets',
    // 'Setting',
    // 'System',
    // 'Help',
    'Home',
    'Configuration',
    'Users',
  ];
  const settings = ['Profile', 'Logout'];
  const theme = createCustomTheme('#002E59', '#f50057');
  const History = useHistory();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettingClick = (setting: string) => {
    if (setting === 'Logout') {
      History.push('/logout');
    }
    handleCloseUserMenu();
  };

  const handleClick = (page: any) => {
    onDataEmit(page);
  };

  const menuItemRenderValidation = (e: any): boolean => {
    if (e) {
      const hasItemInAccess: any = accessData?.filter(
        (item: any) => item?.accessName?.toLowerCase()?.trim() === '/' + e?.toLowerCase()?.trim(),
      );
      if (hasItemInAccess?.length > 0) {
        return true;
      }
      return false;
    }
    return false;
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <img
              src="https://joyb2c.blob.core.windows.net/uploadfiles/Green Metrics Logo.png"
              alt="hello"
              style={{ marginLeft: '0.1px', marginTop: '3px', height: '40px' }}
              // width={210}
            />
            {''}
            <Typography
              variant="h6"
              noWrap
              component="a"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                marginLeft: '1rem',
              }}
            >
              {/* GREEN METRICS */}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              ></IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map(
                  (page: any) =>
                   
                    menuItemRenderValidation(page) && (
                      <MenuItem key={page} onClick={() => handleClick(page)}>
                        <Typography textAlign="center">{page}</Typography>
                      </MenuItem>
                    ),
                    
                )}
              </Menu>
            </Box>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              ESGRC
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map(
                (page: any) =>
                  menuItemRenderValidation(page) && (
                    <Button
                      key={page}
                      onClick={() => handleClick(page)}
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      {page}
                    </Button>
                  ),
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="body1" color="inherit" sx={{ mr: 2, fontWeight: 'bolder', fontSize: '1.2rem', color: 'white' }}>
                Welcome, {username} 
              </Typography>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={username} style={{ backgroundColor: 'white', color: '#4169E1' }}>
                    {initial}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting: any) => (
                  <MenuItem key={setting} onClick={() => handleSettingClick(setting)}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
};

export default withTranslation()(AppHeader);