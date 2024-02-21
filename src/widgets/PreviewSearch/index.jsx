import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { WidgetDataType, usePreviewSearch, widget } from '@sitecore-search/react';
import { Presence, PreviewSearch } from '@sitecore-search/ui';

import { DEFAULT_IMAGE, HIGHLIGHT_DATA } from '../../data/constants';
import { HighlightComponent, getDescription } from '../utils';
import {
  ArticleCardStyled,
  LoaderAnimation,
  LoaderContainer,
  PreviewSearchStyled,
  SearchGroupHeadingStyled,
} from './styled';

// eslint-disable-next-line react/prop-types
export const PreviewSearchNewComponent = ({ defaultItemsPerPage = 8 }) => {
  const {
    widgetRef,
    actions: { onItemClick, onKeyphraseChange },
    queryResult,
    queryResult: {
      isFetching,
      isLoading,
      data: { suggestion: { default_context_aware_suggester : articleSuggestions = [] } = {} } = {},
    },
  } = usePreviewSearch({
    query: (query) => {
      query
        .getRequest()
        .setSearchQueryHighlightFragmentSize(500)
        .setSearchQueryHighlightFields(['title', 'description'])
        .setSearchQueryHighlightPreTag(HIGHLIGHT_DATA.pre)
        .setSearchQueryHighlightPostTag(HIGHLIGHT_DATA.post);
    },
    state: {
      suggestionsList: [{ suggestion: 'default_context_aware_suggester', max: 10 }],
      itemsPerPage: defaultItemsPerPage,
    },
  });

  const loading = isLoading || isFetching;
  const keyphraseHandler = useCallback(
    (event) => {
      const target = event.target;
      onKeyphraseChange({ keyphrase: target.value });
    },
    [onKeyphraseChange],
  );

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // @ts-ignore
    const target = e.target.query;
    navigate(`/search?q=${target.value}`);
    target.value = '';
  };
  return (
    <PreviewSearchStyled.Root>
      <form onSubmit={handleSubmit}>
        <PreviewSearchStyled.Input
          onChange={keyphraseHandler}
          autoComplete="off"
          placeholder="Type to search..."
          name="query"
        />
      </form>
      <PreviewSearchStyled.Content ref={widgetRef}>
        <Presence present={loading}>
          <LoaderContainer>
            <LoaderAnimation
              aria-busy={loading}
              aria-hidden={!loading}
              focusable="false"
              role="progressbar"
              viewBox="0 0 20 20"
            >
              <path d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z" />
            </LoaderAnimation>
          </LoaderContainer>
        </Presence>
        <Presence present={!loading}>
          <>
            {articleSuggestions.length > 0 && (
              <PreviewSearchStyled.Suggestions>
                {articleSuggestions.length > 0 && (
                  <PreviewSearchStyled.SuggestionsGroup id="default_context_aware_suggester">
                    <SearchGroupHeadingStyled>Suggestions</SearchGroupHeadingStyled>
                    {articleSuggestions.map(({ text }) => (
                      <PreviewSearchStyled.SuggestionTrigger id={text} key={text} asChild>
                        <a
                          onClick={() => {
                            navigate(`/search?q=${text}`);
                          }}
                        >
                          {text}
                        </a>
                      </PreviewSearchStyled.SuggestionTrigger>
                    ))}
                  </PreviewSearchStyled.SuggestionsGroup>
                )}
              </PreviewSearchStyled.Suggestions>
            )}
            <PreviewSearch.Results defaultQueryResult={queryResult}>
              {({ isFetching: loading, data: { content: articles = [] } = {} }) => (
                <PreviewSearchStyled.Items data-loading={loading}>
                  <Presence present={loading}>
                    <LoaderContainer>
                      <LoaderAnimation
                        aria-busy={loading}
                        aria-hidden={!loading}
                        focusable="false"
                        role="progressbar"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z" />
                      </LoaderAnimation>
                    </LoaderContainer>
                  </Presence>
                  {!loading &&
                    articles.map((article, index) => (
                      <PreviewSearchStyled.Item key={article.id} asChild>
                        <PreviewSearchStyled.Link
                          href={article.url}
                          onClick={(e) => {
                            e.preventDefault();
                            onItemClick({ id: article.id, index, sourceId: article.source_id });
                            navigate(`/detail/${article.id}`);
                          }}
                        >
                          <ArticleCardStyled.Root>
                            <ArticleCardStyled.ImageWrapper>
                              <ArticleCardStyled.Image src={article.image_url || article.image || DEFAULT_IMAGE} />
                            </ArticleCardStyled.ImageWrapper>
                            <ArticleCardStyled.Name>
                              <HighlightComponent
                                text={getDescription(article, 'name')}
                                preSeparator={HIGHLIGHT_DATA.pre}
                                postSeparator={HIGHLIGHT_DATA.post}
                                highlightElement={HIGHLIGHT_DATA.highlightTag}
                              />
                            </ArticleCardStyled.Name>
                          </ArticleCardStyled.Root>
                        </PreviewSearchStyled.Link>
                      </PreviewSearchStyled.Item>
                    ))}
                </PreviewSearchStyled.Items>
              )}
            </PreviewSearch.Results>
          </>
        </Presence>
      </PreviewSearchStyled.Content>
    </PreviewSearchStyled.Root>
  );
};
const PreviewSearchNewWidget = widget(PreviewSearchNewComponent, WidgetDataType.PREVIEW_SEARCH, 'content');
export default PreviewSearchNewWidget;
