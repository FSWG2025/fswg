import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface SearchProps {
  search: string;
  setSearch: (search: string) => void;
  title: string;
}

const Search = ({ search, setSearch, title }: SearchProps) => {
  return (
    <div className="relative w-full md:w-64">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={`Search ${title}...`}
        className="pl-9 bg-white border-gray-200"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default Search;