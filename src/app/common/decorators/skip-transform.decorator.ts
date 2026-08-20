import { SetMetadata } from '@nestjs/common';
import { SKIP_TRANSFORM_KEY } from '../constants/metadata.constants';

export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
