import React from 'react';
import { Typography, Box } from '@mui/material';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Bring Me Job
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your job search dashboard is ready. Start by exploring the features available to you.
        </Typography>
      </Box>
    </Layout>
  );
};

export default Dashboard;
