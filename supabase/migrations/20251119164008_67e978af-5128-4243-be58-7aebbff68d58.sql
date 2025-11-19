-- Create enum for cycle phases
CREATE TYPE cycle_phase AS ENUM ('menstrual', 'follicular', 'ovulatory', 'luteal');

-- Create cycle_entries table
CREATE TABLE public.cycle_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  phase cycle_phase NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cycle_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a personal app without auth)
CREATE POLICY "Allow all operations on cycle_entries"
ON public.cycle_entries
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cycle_entries_updated_at
BEFORE UPDATE ON public.cycle_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster date lookups
CREATE INDEX idx_cycle_entries_date ON public.cycle_entries(entry_date DESC);