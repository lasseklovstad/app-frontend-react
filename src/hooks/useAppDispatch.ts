// Use throughout your app instead of plain `useDispatch` and `useSelector`
import { useDispatch } from 'react-redux';

import type { AppDispatch } from 'src/redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
