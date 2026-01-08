#Sample 200 rows from yelp.csv dataset for rating prediction task

import pandas as pd

df = pd.read_csv('data/yelp.csv')

df_sample = df.sample(n=200, random_state=42)

df_sample.to_csv('data/yelp_sample_200.csv', index=False)

print(f"Original dataset size: {len(df)} rows")
print(f"Sampled dataset size: {len(df_sample)} rows")
print(f"Sample saved to: data/yelp_sample_200.csv")
print(f"\nRating distribution in sample:")
print(df_sample['stars'].value_counts().sort_index())