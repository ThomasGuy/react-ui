import { Grid, Skeleton, Card, CardHeader, CardContent } from '@mui/material';

export const SkeletonFeed = () => {
  // Generate 4 cards to seamlessly fill the initial view space
  return (
    <>
      {Array.from(new Array(4)).map((_, index) => (
        // Matches your active v9 feed layout structure perfectly
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
          <Card sx={{ m: 1, borderRadius: 2 }}>
            <CardHeader
              avatar={<Skeleton animation="wave" variant="circular" width={40} height={40} />}
              title={<Skeleton animation="wave" height={10} width="80%" sx={{ mb: 1 }} />}
              subheader={<Skeleton animation="wave" height={10} width="40%" />}
            />
            {/* Main structural asset placeholder */}
            <Skeleton animation="wave" variant="rectangular" height={200} />
            <CardContent>
              <Skeleton animation="wave" height={10} sx={{ mb: 1 }} />
              <Skeleton animation="wave" height={10} width="70%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};
