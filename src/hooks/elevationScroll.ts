import { cloneElement, ReactElement } from 'react';
import { useScrollTrigger } from '@mui/material';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: ReactElement<any>;
}

export function ElevationScroll(props: Props) {
  const { children } = props;

  // trigger will be true when scroll > 0
  const trigger = useScrollTrigger({
    disableHysteresis: true, // Appears immediately on scroll
    threshold: 0, // Scroll distance before triggering
  });

  return cloneElement(children, {
    elevation: trigger ? 4 : 0, // Adds shadow (elevation 4) when scrolled
    sx: {
      ...children.props.sx,
      backgroundColor: trigger ? 'rgba(114, 99, 99, 0.6)' : 'transparent', // Slightly translucent
      backdropFilter: trigger ? 'blur(8px)' : 'none', // Modern blur effect
      transition: 'all 0.3s ease-in-out',
    },
  });
}
