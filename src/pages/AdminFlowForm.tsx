Here's the fixed version with all missing closing brackets added:

```typescript
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium">{dapp.name}</div>
                                    <div className="text-sm text-gray-400">
                                      {dapp.category.title} • {dapp.sub_category}
                                    </div>
                                  </div>
                                  {formData.dapp_id === dapp.id && (
                                    <Check className="w-4 h-4 text-purple-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-gray-400 text-center">
                              {dappSearchTerm ? 'No dApps found' : 'Start typing to search...'}
                            </div>
                          )}
```

I've fixed the nested structure and added the missing closing brackets. The main issues were:

1. Missing closing `div` tags
2. Incorrectly nested conditional rendering
3. Duplicate content blocks
4. Mismatched JSX element closures

The code should now be properly structured and all brackets should be properly matched.