"use client";

import { SiteCard } from "./components/SiteCard";
import { SearchBar } from "./components/SearchBar";
import { useState } from "react";
import { Category } from "@/types";
import Sidebar from "./components/Sidebar/index";
import { FullPageScroll } from "@/components/FullPageScroll";
import { useSites } from "@/hooks/useSites";
import { AddSiteCard } from "./components/AddSiteCard";

export default function Home() {
  const { sites: categories, loading, error, refreshSites } = useSites();

  const [activeCategory, setActiveCategory] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState("");

  // 处理页面切换
  const handlePageChange = (pageIndex: number) => {
    if (categories[pageIndex]) {
      setActiveCategory(categories[pageIndex].id);
    }
  };

  // 获取当前分类的索引
  const getCurrentPageIndex = () => {
    return categories.findIndex((category) => category.id === activeCategory);
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 过滤站点
  const getFilteredSites = (category: Category) => {
    if (!searchQuery) return category.sites;
    return category.sites.filter((site) =>
      site.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return <div className="container mx-auto p-4">加载中...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">错误: {error}</div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onCategoriesChange={refreshSites}
      />

      <main className="flex-1 pl-16">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pt-4 px-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="h-[calc(100vh-5rem)]">
          <FullPageScroll
            onPageChange={handlePageChange}
            initialPage={getCurrentPageIndex()}>
            {categories.map((category) => (
              <div key={category.id} className="container mx-auto p-4">
                <div className="flex flex-wrap gap-4 justify-start items-start">
                  {getFilteredSites(category).map((site) => (
                    <SiteCard
                      key={site.id}
                      id={site.id}
                      title={site.title}
                      url={site.url}
                      favicon={site.favicon}
                      categoryId={category.id}
                      onSiteChange={refreshSites}
                    />
                  ))}
                  <AddSiteCard
                    activeCategory={category.id}
                    onSuccess={refreshSites}
                  />
                </div>
              </div>
            ))}
          </FullPageScroll>
        </div>
      </main>
    </div>
  );
}
